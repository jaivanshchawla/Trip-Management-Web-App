/**
 * Document Actions Utility Module
 * Provides copy and share functionality for documents
 */

/**
 * Fetches a presigned URL for sharing a document
 * @param {string} fileUrl - The exact S3 file URL from database (no modifications)
 * @returns {Promise<string>} Promise resolving to the presigned URL
 * @throws {Error} Error with specific message for different failure cases
 */
async function getShareableUrl(fileUrl) {
  try {
    const response = await fetch('/api/files/get-share-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      // Throw the specific error message from the API
      throw new Error(data.message || 'Failed to generate share link');
    }

    if (!data.shareUrl) {
      throw new Error('No share URL returned from server');
    }

    return data.shareUrl;
  } catch (error) {
    console.error('Error fetching shareable URL:', error);
    throw error;
  }
}

/**
 * Determines if a file is an image based on its extension
 * @param {string} filename - The name of the file to check
 * @returns {boolean} true if the file is a PNG, JPG, or JPEG image
 */
export function isImageFile(filename) {
  const extension = filename.toLowerCase().split('.').pop();
  return extension === 'png' || extension === 'jpg' || extension === 'jpeg';
}

/**
 * Fetches an image from a URL and converts it to a Blob
 * @param {string} url - The URL of the image to fetch
 * @returns {Promise<Blob>} Promise resolving to a Blob of the image
 * @throws {Error} Error if fetch fails or response is not ok
 */
export async function fetchImageAsBlob(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    
    // Validate that we got a valid blob
    if (!blob || blob.size === 0) {
      throw new Error('Invalid or empty image data');
    }
    
    return blob;
  } catch (error) {
    console.error('Image fetch error:', error);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Copies a document to the clipboard
 * - For images (PNG, JPG, JPEG): copies the image data
 * - For other files (PDFs): copies the presigned URL
 * @param {string} documentUrl - The URL of the document
 * @param {string} filename - The name of the document file
 * @returns {Promise<{success: boolean, message: string}>} Promise resolving to CopyResult with success status and message
 */
export async function copyDocumentToClipboard(
  documentUrl,
  filename
) {
  try {
    // Check if Clipboard API is supported
    if (!navigator.clipboard) {
      return {
        success: false,
        message: 'Copy not supported on this browser'
      };
    }

    // Validate inputs
    if (!documentUrl || !filename) {
      return {
        success: false,
        message: 'Invalid document information'
      };
    }

    // Generate presigned URL for sharing
    let shareableUrl;
    try {
      shareableUrl = await getShareableUrl(documentUrl);
    } catch (urlError) {
      // Return the specific error message from the API
      return {
        success: false,
        message: urlError.message || 'Failed to generate share link'
      };
    }

    // Handle image files
    if (isImageFile(filename)) {
      try {
        const blob = await fetchImageAsBlob(documentUrl);
        
        // Check if ClipboardItem is supported
        if (typeof ClipboardItem === 'undefined') {
          // Fallback to URL copy if ClipboardItem not supported
          await navigator.clipboard.writeText(shareableUrl);
          return {
            success: true,
            message: 'Copied link to clipboard ✅'
          };
        }
        
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        return {
          success: true,
          message: 'Copied to clipboard ✅'
        };
      } catch (imageError) {
        // Fallback to URL copy if image copy fails
        try {
          await navigator.clipboard.writeText(shareableUrl);
          return {
            success: true,
            message: 'Copied link to clipboard ✅'
          };
        } catch (fallbackError) {
          return {
            success: false,
            message: 'Failed to copy to clipboard'
          };
        }
      }
    } else {
      // For non-image files (PDFs), copy the presigned URL
      await navigator.clipboard.writeText(shareableUrl);
      return {
        success: true,
        message: 'Copied to clipboard ✅'
      };
    }
  } catch (error) {
    console.error('Copy operation error:', error);
    return {
      success: false,
      message: 'Failed to copy to clipboard'
    };
  }
}

/**
 * Shares a document using the Web Share API or indicates fallback is needed
 * @param {string} documentUrl - The URL of the document to share
 * @param {string} filename - The name of the document file
 * @returns {Promise<{success: boolean, requiresFallback: boolean, message?: string, shareableUrl?: string}>} Promise resolving to ShareResult with success status and fallback requirement
 */
export async function shareDocument(
  documentUrl,
  filename
) {
  try {
    // Validate inputs
    if (!documentUrl || !filename) {
      return {
        success: false,
        requiresFallback: false,
        message: 'Invalid document information'
      };
    }

    // Generate presigned URL for sharing
    let shareableUrl;
    try {
      shareableUrl = await getShareableUrl(documentUrl);
    } catch (urlError) {
      // Return the specific error message from the API
      return {
        success: false,
        requiresFallback: false,
        message: urlError.message || 'Failed to generate share link'
      };
    }

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: filename,
          text: 'Sharing document from Awajahi',
          url: shareableUrl
        });
        return {
          success: true,
          requiresFallback: false
        };
      } catch (shareError) {
        // User cancelled the share - silent failure
        if (shareError.name === 'AbortError') {
          return {
            success: true,
            requiresFallback: false
          };
        }
        // Other share errors - show fallback
        console.error('Share API error:', shareError);
        return {
          success: true,
          requiresFallback: true,
          shareableUrl // Pass the URL to fallback dialog
        };
      }
    } else {
      // Web Share API not supported, fallback dialog needed
      return {
        success: true,
        requiresFallback: true,
        shareableUrl // Pass the URL to fallback dialog
      };
    }
  } catch (error) {
    console.error('Share operation error:', error);
    // Fallback to dialog on any unexpected error
    return {
      success: true,
      requiresFallback: true
    };
  }
}
