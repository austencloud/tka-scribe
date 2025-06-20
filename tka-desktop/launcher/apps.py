from typing import List


class AppDefinition:
    def __init__(
        self,
        title: str,
        description: str,
        script_path: str = "",
        command: str = "",
        icon: str | None = "",
        app_type: str = "desktop",  # "desktop" or "web"
        web_app_name: str = "",  # For web apps, the name used by server manager
    ) -> None:
        self.title = title
        self.description = description
        self.script_path = script_path
        self.command = command
        self.icon = icon or "💻"
        self.app_type = app_type
        self.web_app_name = web_app_name


class AppDefinitions:
    """Central place to list launch targets."""

    @staticmethod
    def all() -> List[AppDefinition]:
        return [
            AppDefinition("Legacy", "Full legacy TKA", "legacy/main.py", icon="🔧"),
            AppDefinition("Modern", "Modern TKA demo", "modern/main.py", icon="✨"),
            AppDefinition(
                "Web",
                "Unified web interface with all TKA web apps",
                app_type="web",
                web_app_name="unified",
                icon="🌐",
            ),
            AppDefinition(
                "Landing",
                "TKA marketing and documentation website",
                app_type="web",
                web_app_name="landing",
                icon="🏠",
            ),
            AppDefinition(
                "Animator",
                "Pictograph animation tool",
                app_type="web",
                web_app_name="animator",
                icon="🎬",
            ),
        ]
