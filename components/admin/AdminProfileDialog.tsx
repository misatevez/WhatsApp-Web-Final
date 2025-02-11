import { DEFAULT_AVATAR } from "@/constants/constants"

// ... rest of the imports

export function AdminProfileDialog({ profile, onUpdate, children }: AdminProfileDialogProps) {
  const [name, setName] = useState(profile.name)
  const [avatar, setAvatar] = useState(profile.avatar || DEFAULT_AVATAR)
  // ... rest of the component code
}

