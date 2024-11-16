$(function () {
    const lightbox = document.getElementById('lightbox');
    var captureData,
        capture,
        captureId

    /**
     * 
     * @param {*} imageUrl 
     */
    function showLightbox() {
        lightbox.style.display = 'flex';
    }

    /**
     * 
     */
    function closeLightbox() {
        lightbox.style.display = 'none';
        $('.lightbox img').attr('src', '');
    }
    $('.close').on('click', closeLightbox)

    /**
     * 
     */
    async function getCapture() {
        captureData = {}
        const _capture = await fetch(`/capture/${captureId}`)
            .then(response => response.json());

        const { dimension } = _capture
        capture = _capture.capture

        try {
            // Update image
            const src = `/uploads/${capture.filename}?t=${new Date().getTime()}`

            // $('.lightbox img').css('display', 'none')
            $('.lightbox img').attr('src', src)

            // const { width, height } = dimension
            const width = $('.lightbox img').first().get(0).naturalWidth
            const height = $('.lightbox img').first().get(0).naturalHeight

            lightbox.setAttribute('data-orientation', width > height ? 'landscape' : 'portrait')

            captureData = JSON.parse(capture.capture_data?.data || '{}')
            const keys = Object.keys(captureData)
            console.log('Capture Data', { captureData, keys });

            $('.editable-fields input').each(function () {
                const key = $(this).attr('data-type')
                $(this).val(captureData[key] || '')
            })

            showLightbox()
        }
        catch (error) {
            console.log(error)
        }
    }

    /**
     * 
     */
    document.querySelectorAll('[data-picture]').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            captureId = this.getAttribute('data-capture');
            const index = this.getAttribute('data-index');
            await getCapture();

            lightbox.querySelector('.title h2').innerText = capture.is_label_photo ? 'LABEL' : `SUPPLEMENTAL (${index})`
        });
    });

    /**
     * 
     */
    document.querySelectorAll('.editable-fields input').forEach(input => {
        input.addEventListener('keydown', function (event) {
            console.log('test')
            $('.submit').prop('disabled', false)
            $('.submit').get(0).classList.remove('disabled')
        });
        input.addEventListener('change', function (event) {
            const type = this.getAttribute('data-type');
            captureData[type] = this.value
        });
    });

    /**
     * 
     */
    async function submitData() {
        console.log('capture.is_label_photo', capture.is_label_photo)
        if (capture.is_label_photo && (!capture.capture_data?.id || !capture.capture_data?.status == 'pending'))
            return alert('This capture is still in queue for processing.')

        let submit = $('.submit').get(0)

        console.log('Submitting')
        submit.classList.add('disabled')
        submit.disabled = true
        submit.innerText = 'Please wait...'

        await fetch(`/capture/${captureId}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json" // Set content type to JSON
            },
            body: JSON.stringify(captureData)
        })
            .then(response => {
                if (response.ok) {
                    submit.innerText = 'SUBMIT'
                    alert('Your changes have been saved into database.')
                    closeLightbox()
                    // location.reload()
                }
            }).catch(() => {
                submit.disabled = false
                alert('Unable to save your changes.')
            })
    }
    $('.submit').on('click', submitData)

    /**
     * 
     */
    async function rotateCapture() {
        await fetch(`/capture/${captureId}/rotate`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json" // Set content type to JSON
            },
            body: JSON.stringify({ clockwise: true })
        })
            .then(response => {
                response.ok &&
                    getCapture()
            }).catch(() => {
                alert('Unable to rotate image.')
            })
    }
    $('.rotate').on('click', rotateCapture)

    $('.collapsible').on('click', function () {
        const target = $(this).attr('data-target')
        if ($(this).closest('tr').hasClass('box-row')) {
            const classList = $(this).closest('tbody').get(0).classList
            console.log('classList', classList)
            if (classList.contains('collapsed'))
                classList.remove('collapsed')
            else
                classList.add('collapsed')
        }
        $(`.${target}`).toggle()
    })

})