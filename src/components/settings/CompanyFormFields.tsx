interface ICompanyFormData {
  name: string;
  legal_name: string;
  npwp: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
}

interface IValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  npwp?: string;
}

interface CompanyFormFieldsProps {
  formData: ICompanyFormData;
  errors: IValidationErrors;
  canEdit: boolean;
  onChange: (field: keyof ICompanyFormData, value: string) => void;
  onNpwpChange: (value: string) => void;
}

const INPUT_CLASS = 'w-full h-12 px-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed';
const INPUT_ERROR = 'w-full h-12 px-4 bg-black/40 border border-red-500 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-red-500 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed';
const LABEL_CLASS = 'block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2';

const CompanyFormFields = ({
  formData, errors, canEdit, onChange, onNpwpChange,
}: CompanyFormFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-6 max-[768px]:grid-cols-1">
      {/* Company Name */}
      <div>
        <label className={LABEL_CLASS} htmlFor="company-name">
          Company Name <span className="text-red-400">*</span>
        </label>
        <input
          id="company-name"
          type="text"
          className={errors.name ? INPUT_ERROR : INPUT_CLASS}
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="The Breakery"
          disabled={!canEdit}
        />
        {errors.name && <span className="block text-xs text-red-400 mt-1">{errors.name}</span>}
      </div>

      {/* Legal Name */}
      <div>
        <label className={LABEL_CLASS} htmlFor="legal-name">Legal Name</label>
        <input
          id="legal-name"
          type="text"
          className={INPUT_CLASS}
          value={formData.legal_name}
          onChange={(e) => onChange('legal_name', e.target.value)}
          placeholder="PT The Breakery Indonesia"
          disabled={!canEdit}
        />
      </div>

      {/* NPWP */}
      <div>
        <label className={LABEL_CLASS} htmlFor="npwp">NPWP (Tax Number)</label>
        <input
          id="npwp"
          type="text"
          className={errors.npwp ? INPUT_ERROR : INPUT_CLASS}
          value={formData.npwp}
          onChange={(e) => onNpwpChange(e.target.value)}
          placeholder="XX.XXX.XXX.X-XXX.XXX"
          disabled={!canEdit}
        />
        {errors.npwp && <span className="block text-xs text-red-400 mt-1">{errors.npwp}</span>}
        <span className="block text-xs text-[var(--theme-text-muted)] mt-1">Indonesian tax identification number</span>
      </div>

      {/* Address */}
      <div className="col-span-full">
        <label className={LABEL_CLASS} htmlFor="address">Address</label>
        <textarea
          id="address"
          className="w-full min-h-[100px] px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all resize-y disabled:opacity-50 disabled:cursor-not-allowed"
          value={formData.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Jl. Raya Senggigi No. 123, Lombok Barat, NTB 83355"
          rows={3}
          disabled={!canEdit}
        />
      </div>

      {/* Phone */}
      <div>
        <label className={LABEL_CLASS} htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          className={errors.phone ? INPUT_ERROR : INPUT_CLASS}
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+62 370 123 4567"
          disabled={!canEdit}
        />
        {errors.phone && <span className="block text-xs text-red-400 mt-1">{errors.phone}</span>}
      </div>

      {/* Email */}
      <div>
        <label className={LABEL_CLASS} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className={errors.email ? INPUT_ERROR : INPUT_CLASS}
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="contact@thebreakery.id"
          disabled={!canEdit}
        />
        {errors.email && <span className="block text-xs text-red-400 mt-1">{errors.email}</span>}
      </div>
    </div>
  );
};

export default CompanyFormFields;
