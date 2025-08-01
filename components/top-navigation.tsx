'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Bell, Settings, User, LogOut, UserCog, CreditCard, Shield, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AIIcon } from '@/components/ui/ai-icon'

export function TopNavigation() {
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const notificationsRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowUserProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const notifications = [
    { id: 1, type: 'info', title: 'New AI Model Available', message: 'GPT-4.1 is now available for testing', time: '2 hours ago', unread: true },
    { id: 2, type: 'success', title: 'Agent Created Successfully', message: 'Your marketing assistant agent is ready', time: '1 day ago', unread: true },
    { id: 3, type: 'warning', title: 'API Usage Alert', message: 'You\'ve used 80% of your monthly quota', time: '2 days ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <AIIcon size={20} className="text-primary-foreground" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          One Ai
        </span>
      </div>

      {/* User Actions Section */}
      <div className="flex items-center space-x-4 relative">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {showNotifications && (
            <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border ${notification.unread ? 'bg-muted/50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {showSettings && (
            <Card className="absolute top-12 right-0 w-64 z-50 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <UserCog className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing & Usage
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy & Security
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notification Preferences
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
            onClick={() => setShowUserProfile(!showUserProfile)}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'User'}</p>
            </div>
          </div>

          {showUserProfile && (
            <Card className="absolute top-12 right-0 w-72 z-50 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">User Profile</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowUserProfile(false)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {user?.role?.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-lg font-semibold">1,234</p>
                    <p className="text-xs text-muted-foreground">API Calls</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-lg font-semibold">12</p>
                    <p className="text-xs text-muted-foreground">Agents</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    View Usage
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      logout()
                      setShowUserProfile(false)
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 