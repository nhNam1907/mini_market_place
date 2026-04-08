import type { UserRole } from "@market-place/shared/api";
import { App, Button, Card, Form, Input, Space, Typography } from "antd";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useLoginMutation, useRegisterMutation } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

type AuthFormCardProps = {
  mode: "login" | "register";
  portal: "user" | "admin";
};

type LoginFormValues = {
  email: string;
  password: string;
};

type RegisterFormValues = LoginFormValues & {
  name: string;
};

function AuthFormCard({ mode, portal }: AuthFormCardProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const [form] = Form.useForm<LoginFormValues | RegisterFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title =
    mode === "register"
      ? "Create your customer account"
      : portal === "admin"
        ? "Admin sign in"
        : "Welcome back";

  const description =
    mode === "register"
      ? "Register as a customer to manage orders, account details, and future purchases."
      : portal === "admin"
        ? "Use an admin account to access the operations workspace."
        : "Sign in as a customer or seller to continue with your account.";

  const submitLabel = mode === "register" ? "Create account" : "Sign in";

  const resolveRedirect = (role: UserRole) => {
    if (role === "ADMIN") {
      return "/admin";
    }

    if (role === "SELLER") {
      return "/seller";
    }

    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return from && from.startsWith("/") ? from : "/account";
  };

  const handleLogin = async (values: LoginFormValues) => {
    const response = await loginMutation.mutateAsync(values);

    if (portal === "admin" && response.user.role !== "ADMIN") {
      clearAuth();
      throw new Error("This account does not have admin access");
    }

    if (portal === "user" && response.user.role === "ADMIN") {
      message.info("Admin account detected. Redirecting to admin workspace.");
    }

    await message.success(response.message);
    navigate(resolveRedirect(response.user.role), { replace: true });
  };

  const handleRegister = async (values: RegisterFormValues) => {
    const response = await registerMutation.mutateAsync(values);
    await message.success(response.message);
    navigate("/login", { replace: true });
  };

  const handleFinish = async (values: LoginFormValues | RegisterFormValues) => {
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await handleRegister(values as RegisterFormValues);
      } else {
        await handleLogin(values as LoginFormValues);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to process your request";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="auth-card">
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={2}>{title}</Typography.Title>
          <Typography.Text type="secondary">{description}</Typography.Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {mode === "register" ? (
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Nguyen Van A" size="large" />
            </Form.Item>
          ) : null}

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Email format is invalid" },
            ]}
          >
            <Input placeholder="name@example.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>

          <Button block htmlType="submit" loading={isSubmitting} size="large" type="primary">
            {submitLabel}
          </Button>
        </Form>

        <Typography.Text type="secondary">
          {mode === "register" ? (
            <>
              Already have an account? <Link to="/login">Login here</Link>
            </>
          ) : portal === "admin" ? (
            <>
              Customer or seller account? <Link to="/login">Go to main login</Link>
            </>
          ) : (
            <>
              Need an account? <Link to="/register">Register here</Link>
            </>
          )}
        </Typography.Text>
      </Space>
    </Card>
  );
}

export default AuthFormCard;
