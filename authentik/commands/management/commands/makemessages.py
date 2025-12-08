import re

from django.core.management.commands import makemessages


def is_valid_locale(locale: str) -> re.Match[str] | None:
    """
    Override Django's is_valid_locale to support hyphens in locale codes.
    Fixes issue with zh-Hans and zh-Hant locales.

    See: https://code.djangoproject.com/ticket/36642
    """
    return re.match(r"^[a-z]+$", locale) or re.match(r"^[a-z]+[_-][A-Z0-9].*$", locale)


makemessages.is_valid_locale = is_valid_locale


class Command(makemessages.Command):

    def handle(self, *args: tuple[object, ...], **options: dict[str, object]) -> None:
        option_extensions = {
            "xgettext_options": [
                "--package-name=authentik",
                "--copyright-holder=Authentik Security Inc.",
                "--msgid-bugs-address=https://github.com/goauthentik/authentik/issues",
                "--add-location=file",
                "--width=200",
            ],
            "msguniq_options": ["--width=200"],
            "msgmerge_options": ["--width=200"],
            "msgattrib_options": ["--width=100"],  # Shorter for file locations
        }

        # Apply extensions to each option list
        for attr_name, extensions in option_extensions.items():
            base_options = getattr(makemessages.Command, attr_name)[:]
            setattr(self, attr_name, base_options + extensions)

        super().handle(*args, **options)
