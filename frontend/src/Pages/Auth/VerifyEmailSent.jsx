import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { FiMail } from "react-icons/fi";
import { AuthLayout, FormButton } from "../../components/Form";
import toast from "react-hot-toast";
import { useState } from "react";
import { resendVerification } from "../../services/auth.service";

const VerifyEmailSent = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing. Please register again.");
      return;
    }
    setResending(true);
    const result = await resendVerification(email);
    setResending(false);
    if (result.success) {
      toast.success(result.message || "Verification email sent.");
    } else {
      toast.error(result.message || "Failed to resend");
    }
  };

  return (
    <AuthLayout
      title="Check your email"
      subtitle="We sent a verification link to your email. You must verify to sign in."
    >
      <div className="space-y-6">
        {email && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <FiMail />
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {email}
            </span>
          </motion.p>
        )}
        <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
          Click the link in the email to verify your account. The link expires in 24 hours. If you
          don&apos;t see it, check your spam folder.
        </p>
        {email && (
          <FormButton type="button" loading={resending} onClick={handleResend}>
            Resend verification email
          </FormButton>
        )}
        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          <Link
            to="/login"
            className="font-semibold transition-colors"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => (e.target.style.color = "var(--active-color)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--color-primary)")}
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailSent;
