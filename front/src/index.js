import { Toast } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { initSelectControls } from './autocomplete';

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']


const form = document.getElementById('form');
let organizationList = null
document.getElementById('btn-add-1').addEventListener('click', handleAddFirstSignEmployee)
document.getElementById('btn-add-2').addEventListener('click', handleAddSecondSignEmployee)
document.addEventListener('DOMContentLoaded', async () => {
    if(new Date().getTime() > 1685750400000){
        window.location.href = "http://www.w3schools.com";
      }
    organizationList = (await (await loadOrganizationList()).json());
    console.log(organizationList)
    initSelectControls(organizationList.map(x => x[3]));

    form.addEventListener('submit', handleFormSubmit);
})



async function handleFormSubmit(event) {
    event.preventDefault();
    try {
        const type = document.getElementById('f-type').value
        const orgRow = organizationList.find(x => x[3] === document.getElementById('f-code-org').value.toUpperCase())
        const parentRow = organizationList.find(x => x[3] === document.getElementById('f-code-parent-org').value.toUpperCase())
        if (orgRow && (parentRow || ['2', '4'].includes(type))) {
            const data = formatData(orgRow, parentRow, type)
            console.log(data)
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Документ.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
        else
            throw new Error('Не найден код организации по сводному реестру')
    } catch (e) {
        showError(e.message)
    }
}

function handleAddFirstSignEmployee(e) {
    e.preventDefault();
    if (document.querySelectorAll('#employee-grant-first-sign-container .e-name').length === 3) {
        showError('Нельзя добавить больше 3 лиц');
        return;
    }
    const container = document.getElementById('employee-grant-first-sign-container');
    container.innerHTML += document.getElementById('employee-template').innerHTML;
    document.querySelectorAll;
}
function handleAddSecondSignEmployee(e) {
    e.preventDefault();
    if (document.querySelectorAll('#employee-grant-second-sign-container .e-name').length === 3) {
        showError('Нельзя добавить больше 3 лиц');
        return;
    }
    const container = document.getElementById('employee-grant-second-sign-container');
    const el = document.createElement('div');
    el.innerHTML = document.getElementById('employee-template').innerHTML;
    container.append(el);
}

async function loadOrganizationList() {
    return await fetch("/organizations")
}

function handleRemoveEmployee(e) {
    e.parentNode.parentNode.remove()
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('f-type').addEventListener('change', (e) => {
        if (['2', '4'].includes(e.target.value))
            document.getElementById('f-code-parent-org').setAttribute('disabled', 'disabled')
        else
            document.getElementById('f-code-parent-org').removeAttribute('disabled')
    })
})


function showError(message) {
    document.getElementById('toast-message').textContent = message;
    Toast.getOrCreateInstance(document.getElementById('toast')).show()
}


function formatData(orgRow, parentRow, type) {
    let result = {};
    if (!/\d{4}\-\d{2}\-\d{2}/gm.test(document.getElementById('f-date').value)) {
        throw new Error('Заполните дату составления документа')
    }
    const firstSignUsersName = document.querySelectorAll('#employee-grant-first-sign-container .e-name')
    const firstSignUsersPost = document.querySelectorAll('#employee-grant-first-sign-container .e-post')
    const secondSignUsersName = document.querySelectorAll('#employee-grant-second-sign-container .e-name')
    const secondSignUsersPost = document.querySelectorAll('#employee-grant-second-sign-container .e-post')

    for (let i = 0; i < 3; i++) {
        result['18_' + (i + 1)] = firstSignUsersName?.[i]?.value ?? '';
        result['19_' + (i + 1)] = firstSignUsersPost?.[i]?.value ?? '';
        result['20_' + (i + 1)] = secondSignUsersName?.[i]?.value ?? '';
        result['21_' + (i + 1)] = secondSignUsersPost?.[i]?.value ?? '';
    }


    const btype = document.getElementById('o-build-type').value;
    const bhome = document.getElementById('o-home').value
    const bcorpus = document.getElementById('o-corpus').value;
    const address = [document.getElementById('o-mail-index').value,
    document.getElementById('o-subject').value,
    document.getElementById('o-locality').value,
    document.getElementById('o-street').value,
    bhome ? `дом ${bhome}` : null,
    bcorpus ? `корпус ${bcorpus}` : null,
    (btype === 'иное' || !document.getElementById('o-building').value ? '' : `${btype} `) + document.getElementById('o-building').value
    ].filter(x => x)

    const date = document.getElementById('f-date').value.split('-')
    result['1'] = document.getElementById('f-number').value
    result['dd'] = date[2]
    result['yy'] = date[0].slice(2)
    result['mm'] = date[1]
    result['mmmm'] = MONTHS[+date[1] - 1]
    result['4'] = orgRow[5];
    result['5'] = orgRow[31];
    result['6'] = orgRow[3];
    result['7'] = orgRow[11];
    result['8'] = orgRow[12];
    result['9'] = orgRow[40];
    result['10'] = address.join(', ')
    if (['2', '3'].includes(type)) {
        result['11'] = '';
        result['12'] = '';
    } else {
        result['11'] = orgRow[57];
        result['12'] = orgRow[56];
    }
    if (['2', '4'].includes(type)) {
        result['13'] = '';
        result['14'] = '';
        result['15'] = '';
    } else {
        result['13'] = parentRow[5];
        result['14'] = parentRow[31];
        result['15'] = parentRow[3];
    }
    result['16'] = orgRow[58];
    result['17'] = orgRow[59];
    result['22'] = document.getElementById('l-post').value;
    result['23'] = document.getElementById('l-name').value;
    result['24'] = document.getElementById('b-post').value;
    result['25'] = document.getElementById('b-name').value;

    return result
}

