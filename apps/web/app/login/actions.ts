'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

interface LoginData {
  email: string
  password: string
}

export async function login(loginData: LoginData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword(loginData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

