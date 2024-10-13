from PIL import Image
image = Image.open('8BitDeck_opt2.png')

width = 130
height = 182

card_spacing_x = 142
card_spacing_y = 190

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
        left = col * card_spacing_x
        upper = row * card_spacing_y
        right = (col + 1) * card_spacing_x
        lower = (row + 1) * card_spacing_y

        crop_x = card_spacing_x - width
        crop_y = card_spacing_y - height

        cropped_image = image.crop((left + crop_x / 2, upper + crop_y / 2, right - crop_x / 2, lower - crop_y / 2))
        
        white_bg = Image.new("RGBA", (width, height), (255, 255, 255, 255))
        white_bg.paste(cropped_image, (0, 0), cropped_image)
        white_bg.save(f'output/{suits[row]}-{cardValueToStr[col]}.png')
        
image2 = Image.open('collab_AU_2.png')
for row in range(1):
    for col in range(3):
        left = col * card_spacing_x
        upper = row * card_spacing_y
        right = (col + 1) * card_spacing_x
        lower = (row + 1) * card_spacing_y

        crop_x = card_spacing_x - width
        crop_y = card_spacing_y - height

        cropped_image = image2.crop((left + crop_x / 2, upper + crop_y / 2, right - crop_x / 2, lower - crop_y / 2))
        white_bg = Image.new("RGBA", (width, height), (255, 255, 255, 255))
        white_bg.paste(cropped_image, (0, 0), cropped_image)
        white_bg.save(f'output/{suits[row]}-{cardValueToStr[col+9]}.png')