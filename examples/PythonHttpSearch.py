import urllib.request
import urllib.parse
import urllib.error
import json
import argparse
import sys


def python_query(query: str):
    try:
        # URL encode query parameters
        encoded_query = urllib.parse.quote(query)
        url = f"https://r.jina.ai/https://www.bing.com/search?q={encoded_query}"

        # Create request object and add headers
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        request = urllib.request.Request(url, headers=headers)

        # Send GET request
        with urllib.request.urlopen(request) as response:
            # Read response data
            response_data = response.read().decode("utf-8")

            # Limit response data to 15000 characters
            if isinstance(response_data, str):
                if len(response_data) > 15000:
                    response_data = response_data[:15000] + "... (content truncated)"
            elif isinstance(response_data, dict):
                # If it's a dictionary object, convert to string then limit length
                data_str = json.dumps(response_data)
                if len(data_str) > 15000:
                    truncated_str = data_str[:15000] + '..."} (content truncated)'
                    response_data = json.loads(truncated_str)

            return response_data

    except urllib.error.URLError as e:
        return f"Error performing search: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"


def main():
    # Create argument parser
    parser = argparse.ArgumentParser(
        description="Search Tool", formatter_class=argparse.RawTextHelpFormatter
    )

    # Add command line arguments
    parser.add_argument(
        "-q", "--query", type=str, help="Search query content", default=None
    )

    # Parse command line arguments
    args = parser.parse_args()

    # If no query parameter is provided, prompt user for input
    if args.query is None:
        args.query = input("Please enter search content: ")

    # Execute query
    result = python_query(args.query)
    sys.stdout.buffer.write(str(result).encode("utf-8"))


# Execute main function when run as main program
if __name__ == "__main__":
    main()
