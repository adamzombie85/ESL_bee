import json
import os
import re

def parse_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    data = {}
    current_category = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if it's a category header, like "4 Letter Words" or "5 Letter Words"
        match = re.match(r'(\d+)\s+Letter Words', line, re.IGNORECASE)
        if match:
            length = int(match.group(1))
            current_category = length
            data[current_category] = []
        elif current_category is not None:
            # It's a word
            # Clean up word (remove any leading/trailing spaces, and if it has a hyphen, keep it, but we can lowercase it)
            word = line.lower()
            if word:
                data[current_category].append(word)
                
    return data

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    g3_path = os.path.join(base_dir, 'G3 Spelling Bee_Boox.txt')
    g5_path = os.path.join(base_dir, 'G5 Spelling Bee - Main Word List (bold words are homophones).txt')
    
    word_banks = {}
    
    if os.path.exists(g3_path):
        word_banks['G3'] = parse_file(g3_path)
    else:
        print(f"Warning: {g3_path} not found")
        
    if os.path.exists(g5_path):
        word_banks['G5'] = parse_file(g5_path)
    else:
        print(f"Warning: {g5_path} not found")
        
    output_path = os.path.join(base_dir, 'js', 'words.js')
    
    # Write as a JS module/variable to avoid CORS issues on local file://
    js_content = f"const WORD_BANKS = {json.dumps(word_banks, indent=2)};\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully wrote parsed word banks to {output_path}")

if __name__ == '__main__':
    main()
