import { shadcn } from '@clerk/themes';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(26 81% 50%)", // primary (saffron)
    colorForeground: "hsl(26 75% 9%)",
    colorMutedForeground: "hsl(26 30% 45%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(32 100% 97%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(26 75% 9%)",
    colorNeutral: "hsl(26 25% 85%)",
    fontFamily: "Outfit, system-ui, sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-[24px] w-[440px] max-w-full overflow-hidden shadow-xl border-4 border-orange-100",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold text-[#2A1806]",
    headerSubtitle: "text-[#6A4B35]",
    socialButtonsBlockButtonText: "font-semibold text-[#2A1806]",
    formFieldLabel: "font-bold text-[#2A1806]",
    footerActionLink: "font-bold text-[#E8721A] hover:text-[#1A56E8] transition-colors",
    footerActionText: "text-[#6A4B35]",
    dividerText: "text-[#6A4B35]",
    identityPreviewEditButton: "text-[#E8721A]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#2A1806]",
    logoBox: "flex justify-center mb-4",
    logoImage: "h-16 w-auto object-contain",
    socialButtonsBlockButton: "border-2 border-orange-100 hover:border-[#1A56E8] hover:bg-orange-50 transition-all rounded-xl",
    formButtonPrimary: "bg-[#E8721A] hover:bg-[#D4600E] text-white font-bold rounded-xl py-3 shadow-md shadow-orange-200 border-b-4 border-[#C25000] active:border-b-0 active:translate-y-1 transition-all",
    formFieldInput: "border-2 border-orange-100 focus:border-[#E8721A] focus:ring-[#E8721A] rounded-xl text-lg px-4 py-3 bg-white",
    footerAction: "mt-4",
    dividerLine: "bg-orange-100",
    alert: "bg-red-50 border-2 border-red-200 rounded-xl",
    otpCodeFieldInput: "border-2 border-orange-100 focus:border-[#E8721A] rounded-xl",
    formFieldRow: "mb-4",
    main: "p-6",
  },
};
