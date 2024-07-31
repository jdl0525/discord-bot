import sys
import requests
from colorama import Fore, init

class webhook_manager:
    def __init__(self):
        self.choice = int(input(f"{Fore.MAGENTA}Do you want to delete a webhook? (1){Fore.RESET} >>> "))

        if self.choice != 1:
            print(f"{Fore.RED}Invalid Choice!")
            input(f"{Fore.MAGENTA}Press anything to exit...")
            sys.exit()

        self.webhook = str(input(f"{Fore.MAGENTA}Webhook{Fore.RESET} >>> "))
        print(f"{Fore.GREEN}Deleting Webhook!{Fore.RESET}")
        self.delete_webhook(self.webhook)

    def delete_webhook(self, webhook):
        try:
            response = requests.delete(webhook)
            if response.status_code == 204:
                print(f"{Fore.GREEN}Webhook has been deleted!{Fore.RESET}")
            else:
                print(f"{Fore.RED}Failed to delete webhook. Status code: {response.status_code}{Fore.RESET}")
        except Exception as e:
            print(f"{Fore.RED}Error: {e}{Fore.RESET}")

if __name__ == "__main__":
    init()
    try:
        webhook_manager()
    except KeyboardInterrupt:
        input(f"\n\n{Fore.YELLOW}KeyboardInterrupt: Exiting...{Fore.RESET}")
    except Exception as e:
        input(f"\n\n{Fore.RED}Error: {e}{Fore.RESET}")
