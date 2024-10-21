Interval := 500
ImagePath := ".\ladevorgang.png"
Image2Path := ".\end.png"
Image3Path := ".\download.png"
LoopRunning := false

^F1::
{
    Global LoopRunning
    if (!LoopRunning)
    {
        LoopRunning := true
        while (LoopRunning)
        {
            ErrorLevel := ImageSearch(&FoundX, &FoundY, 80, 350, 650, 630, ImagePath)

            if (ErrorLevel = 0)
            {
                Send("{Enter}")
            }

			ErrorLevel := ImageSearch(&FoundX, &FoundY, 1790, 250, 1900, 310, Image2Path)
			
			If (ErrorLevel = 1)
			{
				Click 1645, 115
				Sleep(1500)
				ImageSearch(&FoundX, &FoundY, 0, 0, A_ScreenWidth, A_ScreenHeight, Image3Path)
				Click FoundX, FoundY
				MsgBox "Book done, wait for download dialog.."
				Global LoopRunning
				LoopRunning := false
			}

            Sleep(Interval)
        }
    }
}

^F2::
{
    Global LoopRunning
    LoopRunning := false
}
