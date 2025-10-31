'use client'

import Link from "next/link"
import React from "react"

export default function ErrorPage() {
  return (
  <div style={{ maxWidth: 420, margin: "48px auto", padding: 24 }}>
   <p>Sorry, something went wrong</p>
   <Link href="/login"><button>Back to login page</button></Link>
   </div>)
}