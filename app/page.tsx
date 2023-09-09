import Link from "next/link";
import styles from "./page.module.css";
import { Button } from "@mui/joy";

export default function Home() {
  return (
    <main className={styles.main}>
      <Link href="/login">
        <Button variant="solid" color="primary">
          Login
        </Button>
      </Link>
    </main>
  );
}
