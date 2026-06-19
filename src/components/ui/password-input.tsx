"use client"

import { type ComponentProps } from "react"
import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

/**
 * A password field with a show/hide toggle. Forwards all Input props (so it
 * works with react-hook-form's `register`).
 */
export function PasswordInput({
  ...props
}: Omit<ComponentProps<typeof Input>, "type">) {
  const [showPassword, setShowPassword] = useState(false)
  const Icon = showPassword ? EyeOffIcon : EyeIcon

  return (
    <InputGroup>
      <InputGroupInput {...props} type={showPassword ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          onClick={() => setShowPassword((p) => !p)}
        >
          <Icon className="size-4.5" />
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
