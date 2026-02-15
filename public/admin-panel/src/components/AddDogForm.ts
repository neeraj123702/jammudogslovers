class AddDogForm {
    constructor() {
        this.form = document.createElement('form');
        this.form.innerHTML = `
            <h2>Add New Dog</h2>
            <label for="dogName">Dog Name:</label>
            <input type="text" id="dogName" required>
            <label for="dogBreed">Dog Breed:</label>
            <input type="text" id="dogBreed" required>
            <label for="dogAge">Dog Age:</label>
            <input type="number" id="dogAge" required>
            <label for="dogImage">Dog Image:</label>
            <input type="file" id="dogImage" accept="image/*" required>
            <button type="submit">Add Dog</button>
        `;
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
        event.preventDefault();
        const dogName = this.form.dogName.value;
        const dogBreed = this.form.dogBreed.value;
        const dogAge = this.form.dogAge.value;
        const dogImage = this.form.dogImage.files[0];

        if (dogImage) {
            const imageUrl = await this.uploadImage(dogImage);
            await this.saveDogData({ name: dogName, breed: dogBreed, age: dogAge, imageUrl });
            alert('Dog added successfully!');
            this.form.reset();
        }
    }

    async uploadImage(imageFile) {
        const storageRef = firebase.storage().ref();
        const imageRef = storageRef.child(`dogs/${imageFile.name}`);
        await imageRef.put(imageFile);
        return await imageRef.getDownloadURL();
    }

    async saveDogData(dogData) {
        const db = firebase.firestore();
        await db.collection('dogs').add(dogData);
    }

    render() {
        return this.form;
    }
}

export default AddDogForm;