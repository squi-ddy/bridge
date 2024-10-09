from PIL import Image
image = Image.open('8BitDeck_opt2.png')

width = 142
height = 190
cardValueToStr = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11-JACK",
    "12-QUEEN",
    "13-KING",
    "1",
]
suits=['HEART','CLUB','DIAMOND','SPADE']



for row in range(4):
    for col in range(13):
        left = col * width
        upper = row * height
        right = left + width
        lower = upper + height

        cropped_image = image.crop((left, upper, right, lower))
        
        white_bg = Image.new("RGBA", (width, height), (255, 255, 255, 255))
        white_bg.paste(cropped_image, (0, 0), cropped_image)
        white_bg.save(f'output/{suits[row]}-{cardValueToStr[col]}.png')
        
image2 = Image.open('collab_AU_2.png')
for row in range(1):
    for col in range(3):
        left = col * width
        upper = row * height
        right = left + width
        lower = upper + height

        cropped_image = image2.crop((left, upper, right, lower))
        white_bg = Image.new("RGBA", (width, height), (255, 255, 255, 255))
        white_bg.paste(cropped_image, (0, 0), cropped_image)
        white_bg.save(f'output/{suits[row]}-{cardValueToStr[col+9]}.png')