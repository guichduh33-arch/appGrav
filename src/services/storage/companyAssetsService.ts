/**
 * Company Assets Storage Service
 *
 * Handles Supabase Storage operations for company assets like logos.
 * Centralizes storage logic to keep components clean.
 *
 * @see Story 1.6: Company Settings UI
 */

import { supabase } from '@/lib/supabase';

/** Storage bucket name for company assets */
const BUCKET_NAME = 'company-assets';

/** Directory for logo files */
const LOGOS_DIR = 'logos';

/**
 * Result of a logo upload operation
 */
export interface ILogoUploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Company Assets Storage Service
 *
 * Provides functions for uploading, deleting, and managing company assets.
 */
export const companyAssetsService = {
  /**
   * Upload a company logo to Supabase Storage
   *
   * @param file - Image file to upload
   * @returns Upload result with public URL on success
   */
  async uploadLogo(file: File): Promise<ILogoUploadResult> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please select an image file' };
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return { success: false, error: 'Image must be smaller than 2MB' };
      }

      // Generate unique filename with fallback for missing extension
      const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'png';
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `${LOGOS_DIR}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('[companyAssets] Upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return { success: true, publicUrl: publicUrlData.publicUrl };
    } catch (error) {
      console.error('[companyAssets] Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Delete a logo from Supabase Storage
   *
   * @param logoUrl - Full public URL of the logo to delete
   * @returns true if deletion successful, false otherwise
   */
  async deleteLogo(logoUrl: string): Promise<boolean> {
    try {
      // Extract path from URL
      const path = logoUrl.split(`/${BUCKET_NAME}/`)[1];
      if (!path) {
        console.warn('[companyAssets] Could not extract path from URL:', logoUrl);
        return false;
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('[companyAssets] Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[companyAssets] Delete error:', error);
      return false;
    }
  },

  /**
   * Replace an existing logo with a new one
   *
   * Uploads the new file first, then deletes the old one if upload succeeds.
   *
   * @param file - New image file to upload
   * @param oldLogoUrl - URL of the existing logo to replace (optional)
   * @returns Upload result with public URL on success
   */
  async replaceLogo(file: File, oldLogoUrl?: string): Promise<ILogoUploadResult> {
    // Upload new logo
    const result = await this.uploadLogo(file);

    if (!result.success) {
      return result;
    }

    // Delete old logo if exists
    if (oldLogoUrl) {
      await this.deleteLogo(oldLogoUrl);
    }

    return result;
  },
};

export default companyAssetsService;
