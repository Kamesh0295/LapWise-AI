const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Upload a local file to Cloudinary
 * @param {string} filePath - Path to local file
 * @param {string} folderName - Subfolder inside Cloudinary (e.g. 'avatars', 'laptops')
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = async (filePath, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `laptop_recommendation/${folderName}`,
      use_filename: true,
      unique_filename: true,
    });

    // Cleanup local temp file asynchronously
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete local temp file: ${filePath}`, err);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // Make sure we delete local file even if upload fails
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete temp file during failure cleanup:', err);
      }
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudinary by its public ID
 * @param {string} publicId - Cloudinary public ID of the resource
 * @returns {Promise<object>}
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
