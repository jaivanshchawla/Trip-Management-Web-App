"use client";

import React, { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import "@/app/globals.css";
import Cookies from "js-cookie";
import { countryCodes } from "@/utils/CountryCodes";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion } from "framer-motion";
import Image from "next/image";
import whiteLogo from '@/assets/awajahi-white-logo.png';
import logo from '@/assets/awajahi logo.png'
import otpPic from '@/assets/otp-pic.png';
import Link from "next/link";
import { isValidPhone } from "@/utils/validate";
import { Loader2 } from "lucide-react";

function OtpLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [session, setSession] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const otpRef = useRef<HTMLDivElement | null>(null)

  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);



  const verifyOtp = async () => {
    startTransition(async () => {
      setError("");

      try {
        const res = await fetch(`/api/login/verifyOtp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otp: otp,
            session: session,
            phone: phoneNumber,
          }),
        });

        const result = await res.json();  

        if (result.status === 200) {
          Cookies.set("selectedRole", "carrier");
          router.push(`/user/home`);
        } else {
          setError("Failed to verify OTP. Please check the OTP.");
        }
      } catch (error) {
        console.log(error);
        setError("Failed to verify OTP. Please check the OTP.");
      }
    });
  };

  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp]);
  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setResendCountdown(60);
    if(!isValidPhone(phoneNumber)){
      setError("Please enter a valid phone number.");
      return;
    }

    startTransition(async () => {
      setError("");

      try {
        const res = await fetch("/api/login/sendOtp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: `${countryCode}${phoneNumber}`,
          }),
        });

        const { data } = await res.json();
        if (data.Status === "Success") {
          setSuccess("OTP sent successfully.");
          setSession(data.Details);
          setTimeout(()=>{
            otpRef.current?.focus()
          },500)
          
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      } catch (err) {
        console.log(err);
        setResendCountdown(0);
        setError("Failed to send OTP. Please try again.");
      }
    });
  };

  return (
    <div className="grid grid-cols-5 min-h-screen">
      <div className="col-span-2 bg-[#FF8833] p-8">
        <div className="flex flex-col items-center justify-center p-6 gap-4">
          <Image src={whiteLogo} alt="logo" width={207} height={220} />
          <h2 className="text-white text-2xl">Awajahi</h2>
          <h1 className="text-[#FFFFFF] mt-10 text-3xl font-semibold">TRUSTED. RELIABLE. EFFICIENT</h1>

        </div>
      </div>
      <div className="col-span-3 flex justify-center items-center bg-white">
        <div className="flex flex-col gap-2 w-full max-w-md p-8">
          <Link href={'/'}>
          <div className="flex items-center mb-6 cursor-pointer">
            <Image src={logo} alt="logo" width={60} height={64} priority />
            <h3 className="text-black font-semibold text-2xl ml-2">Awajahi</h3>
          </div>
          </Link>
          <div>
            {session ? <Image src={otpPic} width={398} height={398} alt="otp img" /> :
              <h3 className="text-black font-semibold text-3xl mb-5">Hey! Welcome to Awajahi</h3>}
          </div>
          <div className="relative">
            {!session && (
              <motion.form
                onSubmit={requestOtp}
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div className="mb-4">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger id="countryCode" aria-label="Country Code">
                      <SelectValue placeholder="Select country code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {countryCodes.map((code, index) => (
                          <SelectItem key={index} value={code.dial_code}>
                            {code.code} {code.name} ({code.dial_code})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </motion.div>
                <motion.div className="mb-4">
                  <label htmlFor="phoneNumber" className="text-[#000000] font-medium mb-2">
                    Mobile no.
                  </label>
                  <Input
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-full"
                  />
                </motion.div>
                <motion.div>
                  <Button
                    type="submit"
                    className="w-full text-center bg-[#FF8833] text-white rounded-full"
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="text-white animate-spin text-center" /> : "Send OTP"}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </div>
          <div className="relative">
            {session && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="text-[#7A7A7A]">Otp Sent to XXXXXXX{phoneNumber.slice(-4)}</label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="otp-input size-full flex items-center justify-between"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} ref={otpRef}key={0}/>
                    <InputOTPSlot index={1} key={1}/>
                    <InputOTPSlot index={2} key={2}/>
                    <InputOTPSlot index={3} key={3}/>
                    <InputOTPSlot index={4} key={4}/>
                    <InputOTPSlot index={5} key={5}/>
                  </InputOTPGroup>
                </InputOTP>
                <span className="text-[#7A7A7A]">
                  Didn&apos;t recieve OTP? <Button variant={'link'} type="submit" disabled={resendCountdown > 0 || isPending} className="text-[#FF6A00]">Resend OTP</Button> {resendCountdown > 0 && `in ${resendCountdown}s`}
                </span>
                <Button
                  onClick={verifyOtp}
                  className="w-full text-center bg-[#FF8833] text-white mt-4 rounded-full text-md"
                  disabled={isPending}
                >
                  {isPending ?  <Loader2 className="text-white animate-spin text-center" /> : "Verify OTP"}
                </Button>
                {/* <Button
                  type="submit"
                  className="w-full text-center mt-4"
                  disabled={resendCountdown > 0 || isPending}
                >
                  Resend OTP 
                </Button> */}
              </motion.div>
            )}
          </div>
          {error && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6"
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

export default OtpLogin;
