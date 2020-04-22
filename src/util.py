def get_lecture_embed_message(channel, lecture):
    """Returns the message with the lecture embed if it exists in channel else None."""
    for message in channel.history(limit=20):
        for embed in message.embeds:
            if embed.title == lecture['embed_title']:
                return message
    return None
