'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Toaster } from './ui/toaster'
import { useToast } from './hooks/use-toast'
import { loadingIndicator } from './ui/LoadingIndicator'
interface FormData {
  name: string
  phone: string
  email: string
  company: string
  notes: string
}

export default function ScheduleDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: ''
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.name) {
      toast({
        description: 'Please fill in the required fields',
        variant: 'warning',
      })
      return
    }
    try {
      // Here you would typically send the form data to your backend
      setLoading(true)
      const res = await fetch('/api/schedule-demo', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        throw new Error('Failed to schedule demo')
      }
      const data = await res.json()
      if (data.status !== 200) {
        throw new Error('Failed to schedule demo')
      }
      setIsOpen(false)
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        notes: ''
      })
      toast({
        description: 'We have your details, we will get back to you shortly',
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#CC5500] text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-[#FF6A00] transition-colors duration-300">
          Schedule Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-full max-w-[95vw] p-0">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 w-full">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-base">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Praveen Yadav"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-base">
                Phone No. <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="text-base">
                Email Id
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                className="mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="company" className="text-base">
                Company Name
              </label>
              <input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="ABC pvt ltd."
                className="mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="notes" className="text-base">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="How can we help you?"
                className="mt-1.5 resize-none"
                rows={3}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#CC5500] hover:bg-[#FF6A00] text-white font-semibold py-3 rounded-lg text-lg"
            disabled={loading}
          >
            {loading ? loadingIndicator : 'Schedule Demo'}
          </Button>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  )
}

