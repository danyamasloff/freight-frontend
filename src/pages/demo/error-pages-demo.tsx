import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Server, 
  Shield, 
  Wifi, 
  Bug,
  Home,
  ArrowLeft,
  ExternalLink,
  Code,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const ErrorPagesDemo = () => {
  const errorPages = [
    {
      id: '404',
      title: '404 - Страница не найдена',
      description: 'Красивая страница для несуществующих маршрутов',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      route: '/error/404',
      status: '404 Not Found'
    },
    {
      id: '500',
      title: '500 - Ошибка сервера',
      description: 'Страница для внутренних ошибок сервера',
      icon: Server,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      route: '/error/500',
      status: '500 Internal Server Error'
    },
    {
      id: '403',
      title: '403 - Доступ запрещен',
      description: 'Страница для ошибок авторизации и доступа',
      icon: Shield,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      route: '/error/403',
      status: '403 Forbidden'
    },
    {
      id: 'network',
      title: 'Ошибка сети',
      description: 'Страница для проблем с подключением',
      icon: Wifi,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      route: '/error/network',
      status: 'Network Error'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Bug className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Демо страниц ошибок
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Тестирование всех типов страниц ошибок с красивым дизайном и анимациями
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              На главную
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/routes">
              <ArrowLeft className="h-4 w-4" />
              К маршрутам
            </Link>
          </Button>
        </motion.div>

        <Separator className="mb-8" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {errorPages.map((page) => {
            const IconComponent = page.icon;
            
            return (
              <Card key={page.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${page.bgColor} mb-3`}>
                      <IconComponent className={`h-6 w-6 ${page.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {page.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {page.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {page.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1 gap-2">
                        <Link to={page.route}>
                          <ExternalLink className="h-3 w-3" />
                          Открыть страницу
                        </Link>
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded font-mono">
                      Маршрут: {page.route}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bug className="h-5 w-5 text-blue-500" />
                Информация о тестировании
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Особенности:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Адаптивный дизайн</li>
                    <li>• Темная/светлая тема</li>
                    <li>• Framer Motion анимации</li>
                    <li>• Автоматическое перенаправление</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Компоненты:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• ErrorBoundary</li>
                    <li>• useErrorHandler хук</li>
                    <li>• Shadcn/ui компоненты</li>
                    <li>• Lucide React иконки</li>
                  </ul>
                </div>
              </div>
              <Separator />
              <p className="text-center text-muted-foreground">
                Каждая страница ошибки имеет уникальный дизайн и функциональность
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          <p>Система страниц ошибок для Freight Management System</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorPagesDemo;
