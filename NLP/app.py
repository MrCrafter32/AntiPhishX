from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
 
# Initialize Flask app
app = Flask(__name__)

# Load the model and tokenizer from Hugging Face
model_name = "mrcrafter32/AntiPhishX-BERT"  # Replace with the correct model name from Hugging Face
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Define the prediction function
def predict_email(text):
    # Tokenize input text
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)

    # Get model predictions
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    predicted_class = torch.argmax(logits, dim=-1).item()
    
    # Convert predicted class to label (if you have specific labels)
    label_map = {0: "Safe", 1: "Phishing"}  # Adjust this to match your label encoding
    label = label_map.get(predicted_class, "Unknown")

    return label, torch.softmax(logits, dim=-1).max().item()

# Define an endpoint to make predictions
@app.route('/predict', methods=['POST'])
def predict():
    # Get the email text from the request
    data = request.get_json()
    email_text = data.get('email_text', '')

    if not email_text:
        return jsonify({'error': 'No email text provided'}), 400

    # Get prediction from model
    label, score = predict_email(email_text)

    # Return the result
    return jsonify({
        'prediction': label,
        'confidence': score
    })

if __name__ == '__main__':
    app.run(debug=True)