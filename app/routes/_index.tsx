import { Form, json, useActionData, redirect } from "@remix-run/react";
import { createCookieSessionStorage } from "@remix-run/node";
import { db } from "server/db";
import { usersTable } from "server/db/schema";
import { eq } from "drizzle-orm";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Alert,
} from "@mui/material";

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

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        flexDirection: { xs: "column", lg: "row" },
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 600, // Wider form
            p: 4, // More padding for better spacing
            border: 1,
            borderRadius: 2,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Sign in to Your App
          </Typography>
          <Typography variant="body2" gutterBottom>
            New User?{" "}
            <Link href="/" underline="hover">
              Contact Support
            </Link>
          </Typography>
          <Form method="post">
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                id="username"
                name="username"
                variant="outlined"
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
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
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ py: 1 }}
            >
              Login
            </Button>
          </Form>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          textAlign: "center",
          p: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Hi, Welcome Back
        </Typography>
        <img
          src="./public/laptop.svg"
          alt="Welcome illustration"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Transforming your experience with{" "}
          <Link href="http://my-weather-app.com" target="_blank" underline="hover">
            Our App
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
