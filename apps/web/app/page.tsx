import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import React from "react";
import { FileUploader } from "@/components/FileUploader";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};


export default function Home() {
  return (
    <div className={styles.page}>
      <FileUploader/>
      <main className={styles.main}>
      </main>
    </div>
  );
}
