import { SignUp } from "@clerk/react";
import { MobileContainer } from "@/components/layout/mobile-container";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpPage() {
  return (
    <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-100 items-center justify-center py-12 px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </MobileContainer>
  );
}
