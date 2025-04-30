pipeline {
    agent any


    triggers {
        githubPush()
    }

    environment {
        COMPOSE_PROJECT_NAME = "antiphishx"
        ENV_CONTENT = credentials('antiphishenv')

    }

    stages {
        stage('Checkout') {
            steps {
                echo "Repository already checked out by Jenkins."
            }
        }

        stage('Inject .env') {
             steps {
                script {
          // Write the .env file into the workspace
          writeFile(file: '.env', text: ENV_CONTENT)
        }
            }       
        }   

        stage('Build Docker Images') {
            steps {
                echo "Building Flask and Next.js containers..."
                sh 'cp .env .'
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
