pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        COMPOSE_PROJECT_NAME = "antiphishx"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Cloning repository..."
                git branch: 'main','https://github.com/MrCrafter32/AntiPhishX.git'
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
