import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StorageFile {
  bucket_name: string;
  file_path: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with user's JWT for initial auth check
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    console.log('Starting account deletion for user:', userId)

    // Now use service role client for deletion operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // STEP 1: Get all storage files BEFORE deleting database records
    console.log('Step 1: Retrieving storage files...')
    const { data: storageFiles, error: filesError } = await supabaseAdmin
      .rpc('get_user_storage_files', { user_id_param: userId })

    if (filesError) {
      console.error('Error getting storage files:', filesError)
      // Continue anyway - we'll try to delete what we can
    }

    console.log(`Found ${storageFiles?.length || 0} files to delete`)

    // STEP 2: Delete all storage files
    if (storageFiles && storageFiles.length > 0) {
      console.log('Step 2: Deleting storage files...')

      // Group files by bucket
      const filesByBucket = storageFiles.reduce((acc, file) => {
        if (!acc[file.bucket_name]) {
          acc[file.bucket_name] = []
        }
        acc[file.bucket_name].push(file.file_path)
        return acc
      }, {} as Record<string, string[]>)

      // Delete from each bucket
      for (const [bucket, paths] of Object.entries(filesByBucket)) {
        console.log(`Deleting ${paths.length} files from bucket: ${bucket}`)

        const { error: storageError } = await supabaseAdmin.storage
          .from(bucket)
          .remove(paths)

        if (storageError) {
          console.error(`Error deleting files from ${bucket}:`, storageError)
          // Continue anyway - files might already be deleted
        } else {
          console.log(`Successfully deleted files from ${bucket}`)
        }
      }
    }

    // STEP 3: Delete user from auth.users
    // This will CASCADE delete:
    // - profiles
    // - notebooks (via profiles CASCADE)
    // - sources (via notebooks CASCADE)
    // - notes (via notebooks CASCADE)
    // - documents (via new user_id CASCADE)
    // - n8n_chat_histories (via new user_id CASCADE)
    console.log('Step 3: Deleting user account...')

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account', details: deleteUserError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully deleted user account and all associated data')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account and all associated data deleted successfully',
        deletedFiles: storageFiles?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
