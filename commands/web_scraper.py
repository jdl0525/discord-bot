import sys
import requests
from bs4 import BeautifulSoup

def scrape(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        title = soup.title.string if soup.title else 'No title found'
        meta_description = soup.find("meta", attrs={"name": "description"})
        meta_description_content = meta_description["content"] if meta_description else 'No meta description found'
        meta_keywords = soup.find("meta", attrs={"name": "keywords"})
        meta_keywords_content = meta_keywords["content"] if meta_keywords else 'No meta keywords found'

        paragraphs = [p.text for p in soup.find_all('p')]
        list_items = [li.text for li in soup.find_all('li')]

        links = [a['href'] for a in soup.find_all('a', href=True)]
        images = [img['src'] for img in soup.find_all('img', src=True)]

        # Format the output
        result = f"**Title:** {title}\n"
        result += f"**Meta Description:** {meta_description_content}\n"
        result += f"**Meta Keywords:** {meta_keywords_content}\n"
        result += f"**Number of Links:** {len(links)}\n"
        result += f"**Number of Images:** {len(images)}\n"
        result += f"**Paragraphs:**\n" + "\n".join(paragraphs) + "\n"
        result += f"**List Items:**\n" + "\n".join(list_items) + "\n"
        result += f"**Links:** " + ", ".join(links) + "\n"
        result += f"**Images:** " + ", ".join(images) + "\n"

        print(result)  # Print the result to stdout
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else None
    if url:
        scrape(url)
    else:
        print("No URL provided.")
