'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import Link from 'next/link'


export function RequestAccountForm({
  className,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    role: '',
    message: '',
  })

  const handleChange = (
    e
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col gap-6 animate-fade-in-up", className)} {...props}>
        <Card className="card-premium overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center p-8 md:p-10">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Request Submitted</h2>
              <p className="text-muted-foreground text-center text-sm mb-6">
                Thank you for your interest in Ethara AI. We&apos;ve received your request and will review it shortly.
              </p>
              <div className="w-full space-y-3 mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-xs">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{formData.email}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mb-6">
                We&apos;ll send you an email at <span className="font-semibold">{formData.email}</span> once your account has been approved.
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({
                    fullName: '',
                    email: '',
                    organization: '',
                    role: '',
                    message: '',
                  })
                }}
                className="btn-primary w-full h-10 rounded-lg font-semibold"
              >
                Submit Another Request
              </Button>
              <a
                href="/login"
                className="mt-3 w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Back to Sign In
              </a>
            </div>

            <div className="relative hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-primary/8 to-accent/5 p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-accent/8" />
              <div className="relative z-10 text-center max-w-xs">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  What happens next?
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                      1
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Review</p>
                      <p className="text-muted-foreground text-xs">Our team reviews your request</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                      2
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Approval</p>
                      <p className="text-muted-foreground text-xs">We verify your organization</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                      3
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Welcome</p>
                      <p className="text-muted-foreground text-xs">Access to Ethara AI platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
		<div
			className={cn("flex flex-col gap-6 animate-fade-in-up", className)}
			{...props}
		>
			<Card className='card-premium overflow-hidden p-0'>
				<CardContent className='grid p-0 md:grid-cols-2'>
					<form className='p-8 md:p-10' onSubmit={handleSubmit}>
						<FieldGroup className='gap-6'>
							<div className='flex flex-col gap-3 text-center'>
								<div className='flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto mb-2'>
									<span className='text-xl font-bold text-primary'>E</span>
								</div>
								<h1 className='text-3xl font-bold tracking-tight'>
									Request Access
								</h1>
								<p className='text-balance text-muted-foreground text-sm'>
									Join Ethara AI's post-training research platform
								</p>
							</div>

							<div className='grid grid-cols-2 gap-4 space-y-4'>
									<Field>
										<FieldLabel
											htmlFor='fullName'
											className='text-sm font-semibold'
										>
											Full Name
										</FieldLabel>
										<Input
											id='fullName'
											name='fullName'
											type='text'
											placeholder='Your full name'
											value={formData.fullName}
											onChange={handleChange}
											required
											className='input-focus h-10 rounded-lg'
										/>
									</Field>

									<Field>
										<FieldLabel
											htmlFor='email'
											className='text-sm font-semibold'
										>
											Email Address
										</FieldLabel>
										<Input
											id='email'
											name='email'
											type='email'
											placeholder='your.email@company.com'
											value={formData.email}
											onChange={handleChange}
											required
											className='input-focus h-10 rounded-lg'
											autoComplete='email'
										/>
									</Field>

									<Field>
										<FieldLabel
											htmlFor='organization'
											className='text-sm font-semibold'
										>
											Organization
										</FieldLabel>
										<Input
											id='organization'
											name='organization'
											type='text'
											placeholder='Your company or institution'
											value={formData.organization}
											onChange={handleChange}
											required
											className='input-focus h-10 rounded-lg'
										/>
									</Field>

									<Field>
										<FieldLabel
											htmlFor='role'
											className='text-sm font-semibold'
										>
											Role / Position
										</FieldLabel>
										<Input
											id='role'
											name='role'
											type='text'
											placeholder='e.g., ML Engineer, Research Lead, Data Scientist'
											value={formData.role}
											onChange={handleChange}
											required
											className='input-focus h-10 rounded-lg'
										/>
									</Field>
							</div>

							<Field>
								<Button
									type='submit'
									className='btn-primary w-full h-10 rounded-lg font-semibold'
									disabled={isLoading}
								>
									{isLoading ?
										<span className='flex items-center gap-2'>
											<svg
												className='w-4 h-4 animate-spin'
												fill='none'
												viewBox='0 0 24 24'
											>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'
												/>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
												/>
											</svg>
											Submitting...
										</span>
									:	"Submit Request"}
								</Button>
							</Field>

							<FieldDescription className='text-center text-xs pt-2'>
								Already have an account?{" "}
								<a
									href='/login'
									className='font-semibold text-primary hover:text-primary/80 transition-colors'
								>
									Sign in here
								</a>
							</FieldDescription>
						</FieldGroup>
					</form>

					<div className='relative hidden md:flex flex-col justify-between bg-gradient-to-br from-primary/8 to-accent/5 p-10'>
						<div className='absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-accent/8' />
						<div className='relative z-10'>
							<div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25 mb-6'>
								<span className='w-2 h-2 bg-primary rounded-full animate-pulse' />
								<span className='text-xs font-medium text-primary'>
									Exclusive Access
								</span>
							</div>
							<h2 className='text-3xl font-bold text-foreground leading-tight mb-3'>
								Join the Future of AI
							</h2>
							<p className='text-muted-foreground text-sm leading-relaxed'>
								Collaborate with leading AI researchers on advanced LLM
								post-training and data operations
							</p>
						</div>

						<div className='relative z-10 space-y-3'>
							<div className='flex gap-2 items-start p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20'>
								<div className='w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5'>
									<svg
										className='w-3 h-3 text-primary'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<div>
									<p className='font-medium text-foreground text-sm'>
										Global Team
									</p>
									<p className='text-muted-foreground text-xs'>
										World-class researchers
									</p>
								</div>
							</div>
							<div className='flex gap-2 items-start p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20'>
								<div className='w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5'>
									<svg
										className='w-3 h-3 text-primary'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<div>
									<p className='font-medium text-foreground text-sm'>
										Cutting-Edge Tools
									</p>
									<p className='text-muted-foreground text-xs'>
										Latest AI frameworks
									</p>
								</div>
							</div>
							<div className='flex gap-2 items-start p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-white/20'>
								<div className='w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5'>
									<svg
										className='w-3 h-3 text-primary'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<div>
									<p className='font-medium text-foreground text-sm'>
										Collaboration
									</p>
									<p className='text-muted-foreground text-xs'>
										Partner with pioneers
									</p>
								</div>
							</div>
						</div>

						<div className='relative z-10 pt-4 border-t border-border/30'>
							<p className='text-xs text-muted-foreground'>
								<span className='font-semibold text-foreground'>
									Typical approval time:
								</span>{" "}
								2-3 business days
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<FieldDescription className='px-6 text-center text-xs text-muted-foreground'>
				By requesting access, you agree to our{" "}
				<Link
					href='#'
					className='font-medium text-foreground hover:text-primary transition-colors'
				>
					Terms of Service
				</Link>{" "}
				and{" "}
				<Link
					href='#'
					className='font-medium text-foreground hover:text-primary transition-colors'
				>
					Privacy Policy
				</Link>
			</FieldDescription>
		</div>
	);
}
