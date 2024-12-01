import { useState } from "react";
import { Form, json, useActionData, redirect } from "@remix-run/react";
import { createCookieSessionStorage } from "@remix-run/node";
import { db } from "server/db";
import { usersTable } from "server/db/schema";
import { eq } from "drizzle-orm";
import { Box, Container, TextField, Typography, Link, Alert, CircularProgress } from "@mui/material";
import { Button } from "~/components/ui/button";

export const { getSession, commitSession } = createCookieSessionStorage({
  cookie: {
    name: "weather_app_session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
});

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .where(eq(usersTable.password, password));

  if (!user) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await getSession();
  session.set("userId", user.id);
  session.set("username", user.username);

  return redirect("/home", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function LoginPage() {
  const actionData = useActionData<{ error?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission

  const handleSubmit = (e: React.FormEvent) => {
    setIsSubmitting(true); // Set submitting state to true
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100vh",
        flexDirection: { xs: "column", sm: "row" },
        bgcolor: "background.default",
      }}
    >
    
      <Box
        sx={{
          flex: 1,
          textAlign: "center",
          p: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Hi, Welcome Back
        </Typography>
        <img
          src="/login.svg"
          alt="Welcome illustration"
          style={{ maxWidth: "40%", height: "auto" }}
        />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Transforming your experience with{" "}
          <Link href="http://my-weather-app.com" target="_blank" underline="hover">
            Our App
          </Link>
        </Typography>
      </Box>

     
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            width: "100%",
            p: 4,
            border: 1,
            borderRadius: 2,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Sign in to Your App
          </Typography>

          <Form method="post" onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Username
              </Typography>
              <TextField
                fullWidth
                id="username"
                name="username"
                variant="outlined"
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                id="password"
                name="password"
                type="password"
                variant="outlined"
                required
              />
            </Box>
            {actionData?.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {actionData.error}
              </Alert>
            )}
            <Button type="submit" variant="default" className="w-full flex-end">
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Login"
              )}
            </Button>
          </Form>
        </Box>
      </Box>
    </Container>
  );
}
