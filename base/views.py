from django.shortcuts import render
from django.http import JsonResponse
from django.core.mail import send_mail
from .utils import get_building_from_ptin



def index(request):
    return render(request, 'base/index.html')

def webmap(request):
    return render(request, 'base/webmap.html')

def tax_assessment(request):
    return render(request, 'base/tax-assessment.html')

def login(request):
    return render(request, 'base/login.html')

def notify(request, year, code):
    building = get_building_from_ptin(year, code)
    outstanding = building['tax_due'] - building['tax_paid']
    mail_message = f"Dear f{building['name']}, \n\n This is a subtle reminder that of {outstanding} NGN on your property with PTIN {building['ptin']}. \n\n Kindly pay soonest. \n\n Warm Regards,\nPTIMS Team."

    try:
        send_mail(subject='Property Tax Notification',
              message= mail_message,
              from_email='tpnewnas@gmail.com',
              recipient_list=[f"{building['email']}"])
    except:
        return JsonResponse({'status': "fail"})
    
    return JsonResponse({'status': 'success', 'building': building})

def property_detail(request, year, code):
    building = get_building_from_ptin(year, code)
    outstanding = float(building['tax_due']) - float(building['tax_paid'])
    if outstanding > 0:
        building['outstanding'] = outstanding
        building['debt_status'] = 'owing'
    else:
        building['debt_status'] = 'not owing'
    return render(request, 'base/property-detail.html', context=building)