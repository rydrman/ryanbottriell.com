pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'hugo --cacheDir "$(pwd)/cache"'
            }
        }
        stage('Deploy') {
            steps {
                sh 'rsync -rv --delete ./public/ /var/www/ryanbottriell/html'
            }
        }
    }
}
