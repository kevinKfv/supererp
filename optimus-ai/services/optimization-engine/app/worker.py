from app.application.tasks import celery_app

# Este archivo permite ejecutar el worker de Celery fácilmente apuntando a "app.worker:celery_app"
if __name__ == '__main__':
    celery_app.start()
