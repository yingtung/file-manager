'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

interface SignupData {
  email: string
  password: string
}

export async function signup(signupData: SignupData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp(signupData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}