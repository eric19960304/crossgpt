import GoogleIcon from "@/app/icons/google.svg";
import { signIn } from "@/auth";
import styles from "./login.module.scss";

export default function LoginPage() {
  return (
    <div className={styles["login-page"]}>
      <div className={styles["login-container"]}>
        <h1 className={styles["login-title"]}>Welcome to CrossGPT</h1>
        <p className={styles["login-subtitle"]}>
          Sign in with your Google account to continue
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/chat" });
          }}
        >
          <button type="submit" className={styles["google-button"]}>
            <GoogleIcon className={styles["google-icon"]} />
            <span>Sign in with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}
