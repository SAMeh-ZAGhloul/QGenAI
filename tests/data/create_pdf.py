from fpdf import FPDF
import os

def create_pdf_from_text(text_file, pdf_file):
    # Create instance of FPDF class
    pdf = FPDF()
    
    # Add a page
    pdf.add_page()
    
    # Set font
    pdf.set_font("Arial", size=12)
    
    # Read text file
    with open(text_file, 'r') as file:
        text = file.readlines()
    
    # Add text to PDF
    for line in text:
        pdf.cell(200, 10, txt=line.strip(), ln=True)
    
    # Save the PDF
    pdf.output(pdf_file)
    
    print(f"PDF created successfully: {pdf_file}")

if __name__ == "__main__":
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define input and output file paths
    text_file = os.path.join(script_dir, "sample_text.txt")
    pdf_file = os.path.join(script_dir, "sample_document.pdf")
    
    # Create PDF
    create_pdf_from_text(text_file, pdf_file)
