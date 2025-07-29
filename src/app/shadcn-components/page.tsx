"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

export default function ShadcnComponentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">shadcn/ui Components Test</h1>
        <p className="text-muted-foreground">
          Testing that shadcn/ui components are working correctly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>
              Different button variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>
              This is a card component with header, content, and footer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Cards are a great way to display information in a structured format.
              This card demonstrates the basic structure with all sections.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Action</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sonner Toast Component</CardTitle>
            <CardDescription>
              Test the Sonner toast notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast("Default toast message")}>
                Default Toast
              </Button>
              <Button 
                variant="secondary"
                onClick={() => toast.success("Success! Everything worked perfectly.")}
              >
                Success Toast
              </Button>
              <Button 
                variant="destructive"
                onClick={() => toast.error("Error! Something went wrong.")}
              >
                Error Toast
              </Button>
              <Button 
                variant="outline"
                onClick={() => toast.warning("Warning! Please check this.")}
              >
                Warning Toast
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm"
                onClick={() => toast.info("Info: Here's some information.")}
              >
                Info Toast
              </Button>
              <Button 
                size="sm"
                variant="ghost"
                onClick={() => toast.loading("Loading...", { duration: 2000 })}
              >
                Loading Toast
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => toast("Custom toast with action", {
                  action: {
                    label: "Undo",
                    onClick: () => toast("Undo clicked!")
                  }
                })}
              >
                Toast with Action
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Installation Success! 🎉</CardTitle>
            <CardDescription>
              shadcn/ui has been successfully installed and configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Your shadcn/ui setup includes:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>✅ Next.js with TypeScript and Tailwind CSS</li>
                <li>✅ shadcn/ui configured with neutral theme</li>
                <li>✅ Button, Card and Sonner components installed</li>
                <li>✅ Proper import aliases (@/components/ui)</li>
                <li>✅ CSS variables for theming</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                You can now add more components using: <code className="bg-muted px-1 py-0.5 rounded">npx shadcn@latest add [component-name]</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}