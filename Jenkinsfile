pipeline {
    agent any

    environment{
        ENV_FILE_PATH = '.env'
    }

    triggers {
        githubPush()
    }

    environment {
        COMPOSE_PROJECT_NAME = "antiphishx"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Repository already checked out by Jenkins."
            }
        }

        stage('Inject .env') {
             steps {
                withCredentials([string(credentialsId: 'antiphishx-env', variable: 'ENV_CONTENT')]) {
                    sh """
                    echo "$ENV_CONTENT" > antiphishx/.env
                    """
                }
            }       
        }   

        stage('Build Docker Images') {
            steps {
                echo "Building Flask and Next.js containers..."
                sh 'docker-compose build'
            }
        }

        stage('Deploy Services') {
            steps {
                echo "Restarting containers..."
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }

        stage('Verify') {
            steps {
                echo "Checking running containers..."
                sh 'docker ps'
            }
        }

        stage('Done') {
            steps {
                echo "Deployment completed successfully."
            }
        }
    }

    post {
        failure {
            echo "Build or deployment failed!"
        }
        success {
            echo "Everything succeeded!"
        }
    }
}
