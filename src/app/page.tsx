'use client'
import Image from "next/image";
import { Button } from 'antd';
import { QrCode } from "@/components";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>History QR</h1>
      <br/>
      <QrCode />
      <div className={styles.description}>
      &nbsp;
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
      </div>
    </main>
  );
}
