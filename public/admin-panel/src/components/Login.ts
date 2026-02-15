import { auth } from '../auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

class Login {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.errorMessage = document.getElementById('errorMessage');

        this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    async handleLogin(event) {
        event.preventDefault();

        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = '/dashboard.html'; // Redirect to dashboard on successful login
        } catch (error) {
            this.errorMessage.textContent = error.message; // Display error message
        }
    }
}

export default Login;