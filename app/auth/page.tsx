"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import axios from "axios" // Bu import endi kerak emas
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../../lib/axios" // Bizning axiosInstance

export default function AuthPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  // Raqam tugmalarini generatsiya qilish uchun massiv
  const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num)
      setError("") // Xatolikni tozalash
    }
  }

  const handleClear = () => {
    setPin("")
    setError("")
  }

  // React Query mutation
  const mutation = useMutation({
    mutationFn: (pinCode: string) =>
      // axiosInstance dan foydalanamiz va URL ni qisqartiramiz, chunki baseURL axiosInstance da belgilangan
      axiosInstance.post("/auth/login/", { // URL: /api/auth/login/ -> /auth/login/
        pin_code: pinCode,
      }),
      // Headers ni bu yerdan olib tashlaymiz, chunki u axiosInstance da global tarzda o'rnatilgan
    onSuccess: (res) => {
      // axiosInstance odatda response.data ni to'g'ridan-to'g'ri qaytaradi.
      // Agar sizning backend res.data.data... kabi javob qaytarsa, shunga moslashtiring.
      // Hozirgi holatda res.data to'g'ri deb hisoblaymiz.
      if (res.status === 200 && res.data) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: res.data.user.first_name,
            role: res.data.user.role.name,
          }),
        )
        localStorage.setItem("token", res.data.access)
        if (res.data.refresh) {
          localStorage.setItem("refresh", res.data.refresh)
        }

        const role = res.data.user.role.name
        console.log("User role:", role); // Konsol log uchun qator raqamini o'zgartirish shart emas

        if (role === "Afitsiant") {
          router.push("/pos")
        } else if (role === "chef") {
          router.push("/kitchen")
        } else if (role === "cashier") {
          router.push("/cashier")
        } else if (role === "Administrator") {
          router.push("/admin")
        } else if (role === "delivery") {
          router.push("/delivery")
        } else {
          setError("Noma'lum rol: " + role)
        }
      } else {
        // Backend dan kelishi mumkin bo'lgan xatolik xabarini olishga harakat
        setError(res.data?.detail || "Tizimga kirishda xatolik yuz berdi")
      }
    },
    onError: (err: any) => { // Xatolik tipini any deb qoldiramiz, yoki AxiosError import qilish mumkin
      // axiosInstance interceptorida xatoliklar log qilinadi,
      // lekin bu yerda UI uchun maxsus xabar berishimiz mumkin.
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail)
      } else if (err.response && err.response.data && err.response.data.pin_code && Array.isArray(err.response.data.pin_code)) {
        setError(err.response.data.pin_code.join(" ")) // Misol uchun, agar pin_code xatolari massiv bo'lsa
      }
      else {
        setError("Noto'g'ri PIN-kod yoki server xatosi")
      }
      console.error("Login mutation error object:", err) // Xatolikni to'liqroq ko'rish
    }
  })

  const handleLogin = () => {
    if (pin.length !== 4) {
        setError("PIN-kod 4 ta raqamdan iborat bo'lishi kerak.")
        return;
    }
    setError("") // Yangi urinishdan oldin xatolikni tozalash
    mutation.mutate(pin)
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">SmartResto</CardTitle>
          <CardDescription>Tizimga kirish uchun PIN-kodni kiriting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 rounded-md border p-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Xodim</Label>
              {/* Bu yerda foydalanuvchi nomi yoki "Foydalanuvchi" kabi umumiy matn bo'lishi mumkin */}
              <p className="font-medium">Foydalanuvchi</p>
            </div>
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <Input
              type="password"
              value={pin}
              readOnly
              className="text-center text-2xl tracking-widest h-14"
              maxLength={4}
              placeholder="****"
            />
            {(error || (mutation.isError && !mutation.isPending)) && ( // Xatolikni faqat yuklanish tugagandan keyin ko'rsatish
              <p className="text-sm text-destructive mt-1 text-center">{error}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {keypadNumbers.map((num) => (
              <Button
                key={num}
                variant="outline"
                className="h-14 text-xl font-semibold"
                onClick={() => handleNumberClick(num)}
              >
                {num}
              </Button>
            ))}
            <Button variant="outline" className="h-14 text-xl font-semibold" onClick={handleClear}>
              Tozalash
            </Button>
            <Button variant="outline" className="h-14 text-xl font-semibold" onClick={() => handleNumberClick(0)}>
              0
            </Button>
            <Button
              variant="default"
              className="h-14 text-xl font-semibold bg-primary" // w-full olib tashlanishi mumkin, chunki grid elementi
              onClick={handleLogin}
              disabled={pin.length !== 4 || mutation.isPending}
            >
              {mutation.isPending ? "Kirish..." : "Kirish"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-4"> {/* pt-4 qo'shildi */}
          <p className="text-xs text-center text-muted-foreground">
            Agar PIN-kodni unutgan bo'lsangiz, administrator bilan bog'laning
          </p>

          {/* Sample PIN codes for testing */}
          <div className="border-t pt-2 mt-2 w-full">
            <p className="text-xs text-center font-medium mb-1">Namuna PIN kodlar (test uchun):</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-center"> {/* Namunalarga moslab grid-cols-2 */}
              <div className="border rounded p-1">
                <p className="font-medium">Afitsiant</p>
                <p className="text-primary">1234</p>
              </div>
              {/* Siz kommentga olgan kodlar shu yerda edi */}
              <div className="border rounded p-1">
                <p className="font-medium">Administrator</p>
                <p className="text-primary">2006</p>
              </div>
            </div>
          </div>
        </CardFooter>
          <h3 className="font-medium text-center text-zinc-400 pb-4">© 2025 <a href="https://t.me/O_Omadbek" className="hover:underline">CDC Group.</a> Barcha huquqlar himoyalangan.</h3>
      </Card>
    </div>
  )
}