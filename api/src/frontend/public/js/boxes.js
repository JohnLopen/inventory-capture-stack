$(function () {
    const lightbox = document.getElementById('lightbox');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');
    var captureData,
        capture,
        captureId

    /**
     * 
     * @param {*} imageUrl 
     */
    function showLightbox() {
        lightboxBackdrop.style.display = 'flex';
    }

    /**
     * 
     */
    function closeLightbox() {
        lightboxBackdrop.style.display = 'none';
        $('.lightbox img').attr('src', '');
        lightbox.classList.remove('loading')
    }
    $('.close').on('click', closeLightbox)
    $(lightboxBackdrop).on('click', (e) => {
        const light = $(e.target).closest('.lightbox')
        if (!light.length)
            closeLightbox()
    })

    /**
     * 
     */
    async function getCapture() {
        captureData = {}
        showLightbox()

        try {
            const _capture = await fetch(`/capture/${captureId}`)
                .then(response => response.json());

            capture = _capture.capture

            lightbox.classList.remove('loading')

            // Update image
            const src = `/uploads/${capture.filename}?t=${new Date().getTime()}`

            // Set the orientation after load
            $('.lightbox img').get(0).onload = () => {
                const width = $('.lightbox img').first().get(0).naturalWidth
                const height = $('.lightbox img').first().get(0).naturalHeight
                lightbox.setAttribute('data-orientation', width > height ? 'landscape' : 'portrait')
            }

            // Set image src
            $('.lightbox img').attr('src', src)

            captureData = JSON.parse(capture.capture_data?.data || '{}')
            const keys = Object.keys(captureData)
            console.log('Capture Data', { captureData, keys });

            $('.editable-fields input').each(function () {
                const key = $(this).attr('data-type')
                $(this).val(captureData[key] || '')
            })
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

        lightbox.classList.add('loading')

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
                lightbox.classList.remove('loading')
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
        let classList
        if ($(this).closest('tr').hasClass('box-row'))
            classList = $(this).closest('tbody').get(0).classList
        else if ($(this).closest('tr').hasClass('part-row'))
            classList = $(this).closest('tr').get(0).classList
        else
            return
        console.log('classList', classList)
        if (classList.contains('collapsed')) {
            classList.remove('collapsed')
            classList.add('expanded')
        }
        else {
            classList.add('collapsed')
            classList.remove('expanded')
        }
        $(`.${target}`).toggle()
    })

})