import { useRef } from 'react';
import { Building2, Upload, Trash2, Loader2 } from 'lucide-react';

interface CompanyLogoSectionProps {
  logoUrl: string;
  canEdit: boolean;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const CompanyLogoSection = ({
  logoUrl, canEdit, isUploading, onUpload, onRemove,
}: CompanyLogoSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pb-6 border-b border-white/5">
      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-3">
        Company Logo
      </label>
      <div className="flex items-start gap-6 max-[768px]:flex-col max-[768px]:items-center">
        {logoUrl ? (
          <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden bg-black/40 border-2 border-white/10 group">
            <img src={logoUrl} alt="Company logo" className="w-full h-full object-contain" />
            {canEdit && (
              <button
                type="button"
                className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center bg-red-500/90 text-white border-none rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
                title="Remove logo"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="w-[120px] h-[120px] flex flex-col items-center justify-center gap-1 bg-black/40 border-2 border-dashed border-white/10 rounded-xl text-[var(--theme-text-muted)]">
            <Building2 size={48} />
            <span className="text-xs">No logo uploaded</span>
          </div>
        )}
        {canEdit && (
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {logoUrl ? 'Change Logo' : 'Upload Logo'}
                </>
              )}
            </button>
            <span className="text-xs text-[var(--theme-text-muted)]">
              PNG, JPG up to 2MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyLogoSection;
