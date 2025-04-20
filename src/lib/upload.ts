export async function uploadFile(file: File, accessToken: string): Promise<string> {
  try {
    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Upload file
    const response = await fetch('http://localhost:4003/upload-license', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload file')
    }

    const data = await response.json()
    return data.url // Assuming the API returns the file URL
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
} 