import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AtSign } from "lucide-react";
import { Linkedin } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className="w-screen min-h-screen bg-gradient-to-tl from-white via-white to-white">
      {/* <div className="absolute top-10 right-10 m-4">
        <UserButton afterSignOutUrl="/" />
      </div> */}
      {/* Navigation bar */}
      <nav className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-4 ms-3">
          <a href="/" className="text-xl font-bold">
            PaperTalk
          </a>
        </div>

        <div className="flex items-center space-x-4 me-5">
          <div className="hover:underline me-5">
            <HoverCard>
              <HoverCardTrigger>Builder Contact</HoverCardTrigger>
              <HoverCardContent className="w-80 flex items-center">
                <AtSign className="w-4 h-4 mr-2" />
                <a
                  href="https://www.linkedin.com/in/well-zhang/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline me-2"
                >
                  Zhongwei Zhang
                </a>
              </HoverCardContent>
            </HoverCard>
          </div>

          <a
            href="https://github.com/babelpainterwell/papertalk-well"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline me-5"
          >
            GitHub
          </a>

          {/* UserButton or Sign-in/Sign-up Links */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">TALK TO YOUR PAPER</h1>
          </div>

          <div className="w-full mt-4">
            {isAuth ? (
              <Link href="/dashboard" className="me-3">
                <Button>
                  Go to Dashboard
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="me-3">
                  <Button>
                    Login to get Started!
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button>
                    Sign Up
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
